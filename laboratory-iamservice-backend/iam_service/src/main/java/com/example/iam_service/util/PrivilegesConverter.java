package com.example.iam_service.util;

import com.example.iam_service.entity.Enum.Privileges;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.EnumSet;
import java.util.stream.Collectors;

@Slf4j
@Converter(autoApply = false)
@Component
public class PrivilegesConverter implements AttributeConverter<EnumSet<Privileges>, String> {
    private static final String DELIMITER = ",";

    //Convert enums to database storables (String)
    @Override
    public String convertToDatabaseColumn(EnumSet<Privileges> attribute) {
        if ( attribute.isEmpty()||attribute == null) {
            return null;
        }
        String privilegesString = "";
        privilegesString = attribute.stream()
                .map(Enum::name)
                .sorted()//Consistent storing
                .collect(Collectors.joining(DELIMITER));
        return privilegesString;
    }

    //Convert enums to entity attribute
    @Override
    public EnumSet<Privileges> convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.trim().isEmpty()) {
            return EnumSet.noneOf(Privileges.class);
        }
        EnumSet<Privileges> privilegesEnumSet = EnumSet.noneOf(Privileges.class); // create an empty enum set
        Arrays.stream(dbData.split(DELIMITER))//convert to array of string using the DELIMITER
                .filter(s -> !s.isEmpty())//filter empty strings or spaces
                .forEach(privilegesName ->
                        {
                            try {
                                privilegesEnumSet.add(Privileges.valueOf(privilegesName));
                            } catch (Exception e) {
                                throw new RuntimeException(e);
                            }
                        }
                );
        return privilegesEnumSet;
    }

}
