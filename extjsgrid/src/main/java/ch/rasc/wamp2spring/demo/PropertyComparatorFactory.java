package ch.rasc.wamp2spring.demo;

import java.util.Collection;
import java.util.Comparator;

import org.springframework.expression.ParseException;

public enum PropertyComparatorFactory {

	INSTANCE;

	public static <T> Comparator<T> createComparator(String propertyName,
			SortDirection sortDirection) {
		try {
			Comparator<T> comparator = new PropertyComparator<>(propertyName);

			if (sortDirection == SortDirection.DESC) {
				comparator = comparator.reversed();
			}

			return comparator;
		}
		catch (ParseException e) {
			return null;
		}
	}

	@SuppressWarnings("unchecked")
	public static <T> Comparator<T> createComparatorFromSorters(
			Collection<SortInfo> sortInfos) {
		Comparator<T> comparator = null;

		if (sortInfos != null) {
			comparator = sortInfos.stream()
					.map(a -> (Comparator<T>) createComparator(a.getProperty(),
							a.getDirection()))
					.reduce(comparator, (a, b) -> a != null ? a.thenComparing(b) : b);
		}

		return comparator;
	}

}
