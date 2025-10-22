package com.example.iam_service.entity.Enum;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.ToString;
import lombok.experimental.FieldNameConstants;

@Getter
@AllArgsConstructor
@ToString
@FieldNameConstants
@Schema(description = "Privileges enum.")
public enum EnumBackup {
    // Test Order Management
    READ_ONLY("Only have right to view patient test orders and patient test order results"),
    CREATE_TEST_ORDER("Have right to create a new patient test order"),
    MODIFY_TEST_ORDER("Have right to modify information a patient test order"),
    DELETE_TEST_ORDER("Have right to delete an exist test order"),
    REVIEW_TEST_ORDER("Have right to review, modify test result of test order"),

    // Comment Management
    ADD_COMMENT("Have right to add a new comment for test result"),
    MODIFY_COMMENT("Have right to modify a comment"),
    DELETE_COMMENT("Have right to delete a comment"),

    // Configuration Management
    VIEW_CONFIGURATION("Have right to view, add, modify and delete configurations"),
    CREATE_CONFIGURATION("Have right to add a new configuration"),
    MODIFY_CONFIGURATION("Have right to modify a configuration"),
    DELETE_CONFIGURATION("Have right to delete a configuration"),

    // User Management
    VIEW_USER("Have right to view all user profiles"),
    CREATE_USER("Have right to create a new user"),
    MODIFY_USER("Have right to modify a user"),
    DELETE_USER("Have right to delete a user"),
    LOCK_UNLOCK_USER("Have right to lock or unlock a user"),

    // Role Management (Laboratory Management)
    VIEW_ROLE("Have right to view all role privileges"),
    CREATE_ROLE("Have right to create a new custom role"),
    UPDATE_ROLE("Have right to modify privileges of custom role"),
    DELETE_ROLE("Have right to delete a custom role"),

    // Event Logs
    VIEW_EVENT_LOGS("Have right to view event logs"),

    // Reagent Management
    ADD_REAGENTS("Have right to add new reagents"),
    MODIFY_REAGENTS("Have right to modify reagent information"),
    DELETE_REAGENTS("Have right to delete a regents"),

    // Instrument Management
    ADD_INSTRUMENT("Have right to add a new instrument into system management"),
    VIEW_INSTRUMENT("Have right to view all instrument and check instrument status"),
    ACTIVATE_DEACTIVATE_INSTRUMENT("Have right to activate or deactivate instrument"),

    // Blood Testing
    EXECUTE_BLOOD_TESTING("Have right to execute a blood testing");

    private final String description;
}
