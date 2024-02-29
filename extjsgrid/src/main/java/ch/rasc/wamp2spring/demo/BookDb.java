package ch.rasc.wamp2spring.demo;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.apache.commons.lang3.reflect.FieldUtils;

public class BookDb {
	private final static Map<String, Book> db = new ConcurrentHashMap<>();

	static {
		Book b = new Book();
		b.setTitle("Sencha Touch in Action");
		b.setIsbn("9781617290374");
		b.setLink("http://www.manning.com/garcia2/");
		b.setPublisher("Manning");
		create(b);

		b = new Book();
		b.setTitle("Ext JS in Action, Second Edition");
		b.setIsbn("9781617290329");
		b.setLink("http://www.manning.com/garcia3/");
		b.setPublisher("Manning");
		create(b);

		b = new Book();
		b.setTitle("Learning Ext JS 4");
		b.setIsbn("9781849516846");
		b.setLink("http://www.packtpub.com/learning-ext-javascript-4/book");
		b.setPublisher("Packt");
		create(b);

		b = new Book();
		b.setTitle("Sencha MVC Architecture");
		b.setIsbn("9781849518888");
		b.setLink(
				"http://www.packtpub.com/sencha-model-view-controller-architecture/book");
		b.setPublisher("Packt");
		create(b);

		b = new Book();
		b.setTitle("Creating Mobile Apps with Sencha Touch 2");
		b.setIsbn("9781849518901");
		b.setLink(
				"http://www.packtpub.com/creating-mobile-apps-with-sencha-touch-2/book");
		b.setPublisher("Packt");
		create(b);

		b = new Book();
		b.setTitle("Sencha Touch Cookbook, Second Edition");
		b.setIsbn("9781782169185");
		b.setLink("http://www.packtpub.com/sencha-touch-cookbook-second-edition/book");
		b.setPublisher("Packt");
		create(b);

		b = new Book();
		b.setTitle("Instant Sencha Touch");
		b.setIsbn("9781782165989");
		b.setLink(
				"http://www.packtpub.com/build-native-applications-with-sencha-touch/book");
		b.setPublisher("Packt");
		create(b);

		b = new Book();
		b.setTitle("Sencha Architect App Development");
		b.setIsbn("9781782169819");
		b.setLink("http://www.packtpub.com/sencha-architect-app-development/book");
		b.setPublisher("Packt");
		create(b);

		b = new Book();
		b.setTitle("Instant Ext JS Starter");
		b.setIsbn("9781782166108");
		b.setLink("http://www.packtpub.com/ext-js-starter/book");
		b.setPublisher("Packt");
		create(b);

		b = new Book();
		b.setTitle("Ext JS 4 Plugin and Extension Development");
		b.setIsbn("9781782163725");
		b.setLink(
				"http://www.packtpub.com/ext-js-4-plugin-and-extension-development/book");
		b.setPublisher("Packt");
		create(b);

		b = new Book();
		b.setTitle("Ext JS 4 Web Application Development Cookbook");
		b.setIsbn("9781849516860");
		b.setLink(
				"http://www.packtpub.com/sencha-ext-js-4-web-application-development-cookbook/book");
		b.setPublisher("Packt");
		create(b);

		b = new Book();
		b.setTitle("Ext JS 4 First Look");
		b.setIsbn("9781849516662");
		b.setLink("http://www.packtpub.com/ext-js-4-first-look/book");
		b.setPublisher("Packt");
		create(b);

	}

	public static List<Book> list() {
		return new ArrayList<>(db.values());
	}

	public static void create(Book newBook) {
		if (newBook.getId() == null) {
			newBook.setId(UUID.randomUUID().toString());
		}
		db.put(newBook.getId(), newBook);
	}

	public static Book read(String id) {
		return db.get(id);
	}

	public static void update(Map<String, Object> updatedFields) {
		String id = (String) updatedFields.get("id");
		Book book = read(id);

		updatedFields.keySet().forEach(k -> {
			if (!"id".equals(k)) {
				try {
					FieldUtils.writeField(book, k, updatedFields.get(k), true);
				}
				catch (IllegalAccessException e) {
					e.printStackTrace();
				}
			}
		});
	}

	public static void delete(Book deleteBook) {
		db.remove(deleteBook.getId());
	}
}
