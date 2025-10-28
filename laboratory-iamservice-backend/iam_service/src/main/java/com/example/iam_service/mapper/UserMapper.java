package com.example.iam_service.mapper;

import com.example.iam_service.dto.user.AdminUpdateUserDTO;
import com.example.iam_service.dto.user.DetailUserDTO;
import com.example.iam_service.dto.user.UpdateUserProfileDTO;
import com.example.iam_service.dto.user.UserDTO;
import com.example.iam_service.entity.User;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserMapper INSTANCE = Mappers.getMapper(UserMapper.class);

    UserDTO toDto(User user);
    User toEntity(UserDTO dto);
    DetailUserDTO toDetailDto(User user);


    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateUserFromProfileDto(UpdateUserProfileDTO dto, @MappingTarget User user);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateUserFromAdminDto(AdminUpdateUserDTO dto, @MappingTarget User user);
}
