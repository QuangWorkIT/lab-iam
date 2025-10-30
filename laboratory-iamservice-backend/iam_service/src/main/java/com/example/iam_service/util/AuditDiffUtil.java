package com.example.iam_service.util;

import java.lang.reflect.Field;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

public class AuditDiffUtil {
    private static final Map<Class<?>, Field[]> FIELD_CACHE = new ConcurrentHashMap<>();
    private static final Set<String> IGNORED_FIELDS = Set.of("password", "createdAt", "age");

    public static String generateDiff(Object before, Object after) {
        if (before == null || after == null) return "Cannot compare null objects.";
        if (!before.getClass().equals(after.getClass()))
            return "Different types: " + before.getClass() + " vs " + after.getClass();

        Field[] fields = FIELD_CACHE.computeIfAbsent(before.getClass(), clazz -> {
            Field[] f = clazz.getDeclaredFields();
            for (Field x : f) x.setAccessible(true);
            return f;
        });

        List<String> diffs = new ArrayList<>();
        for (Field f : fields) {
            if (IGNORED_FIELDS.contains(f.getName())) continue;
            try {
                Object oldVal = f.get(before);
                Object newVal = f.get(after);
                if (!Objects.equals(oldVal, newVal)) {
                    diffs.add(String.format("%s (%s ➜ %s)",
                            f.getName(), nullSafe(oldVal), nullSafe(newVal)));
                }
            } catch (IllegalAccessException ignored) {}
        }

        return diffs.isEmpty()
                ? "No changes detected."
                : "Updated fields: " + String.join(", ", diffs);
    }

    private static String nullSafe(Object val) {
        return val == null ? "null" : val.toString();
    }
}
