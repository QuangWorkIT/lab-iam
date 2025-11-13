package com.example.iam_service.dto.user;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DetailUserDTO extends UserDTO {
    private String identityNumber;
    private Boolean isDeleted;
}
