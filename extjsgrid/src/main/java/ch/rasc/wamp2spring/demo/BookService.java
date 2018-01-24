package ch.rasc.wamp2spring.demo;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import ch.rasc.wamp2spring.WampPublisher;
import ch.rasc.wamp2spring.annotation.WampProcedure;
import ch.rasc.wamp2spring.annotation.WampSessionId;

@Service
public class BookService {

	private final ObjectMapper objectMapper;

	private final WampPublisher wampPublisher;

	public BookService(WampPublisher wampPublisher, ObjectMapper objectMapper) {
		this.wampPublisher = wampPublisher;
		this.objectMapper = objectMapper;
	}

	@WampProcedure("grid.read")
	public Collection<Book> bookRead(StoreReadRequest readRequest) throws Throwable {

		List<Book> list = BookDb.list();

		if (StringUtils.hasText(readRequest.getSort())) {
			List<SortInfo> si = this.objectMapper.readValue(readRequest.getSort(),
					new TypeReference<List<SortInfo>>() {
						// nothing_here
					});
			readRequest.setSortInfo(si);

			Comparator<Book> comparator = PropertyComparatorFactory
					.createComparatorFromSorters(readRequest.getSortInfo());

			if (comparator != null) {
				list.sort(comparator);
			}
		}
		return list;
	}

	@WampProcedure("grid.create")
	public List<Book> bookCreate(List<Book> books, @WampSessionId long wampSessionId) {
		System.out.println("bookCreate:" + wampSessionId);

		List<Book> result = new ArrayList<>();
		for (Book book : books) {
			BookDb.create(book);
			result.add(book);
		}

		this.wampPublisher.publishToAllExcept(wampSessionId, "grid.oncreate", result);
		return result;
	}

	@WampProcedure("grid.update")
	public List<Map<String, Object>> bookUpdate(List<Map<String, Object>> requestData,
			@WampSessionId long wampSessionId) {
		System.out.println("bookUpdate:" + wampSessionId);

		List<Map<String, Object>> result = new ArrayList<>();
		for (Map<String, Object> updatedFields : requestData) {
			BookDb.update(updatedFields);
			result.add(updatedFields);
		}

		this.wampPublisher.publishToAllExcept(wampSessionId, "grid.onupdate", result);
		return result;
	}

	@WampProcedure("grid.destroy")
	public void bookDestroy(List<Book> books,
			@WampSessionId long wampSessionId) throws Throwable {
		System.out.println("bookDestroy:" + wampSessionId);
		for (Book book : books) {
			BookDb.delete(book);
		}
		this.wampPublisher.publishToAllExcept(wampSessionId, "grid.ondestroy", books);
	}
}
