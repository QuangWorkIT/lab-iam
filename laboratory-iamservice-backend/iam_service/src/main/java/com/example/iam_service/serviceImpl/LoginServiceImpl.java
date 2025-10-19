package com.example.iam_service.serviceImpl;

import com.example.iam_service.entity.User;
import com.example.iam_service.repository.UserRepository;
import com.example.iam_service.service.LoginService;
import lombok.AllArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@AllArgsConstructor
public class LoginServiceImpl implements LoginService {
    private final BCryptPasswordEncoder encoder;
    private final UserRepository userRepository;

    @Override
    public User authenticate(String email, String password) {
       try {
           Optional<User> userFound = userRepository.findByEmail(email);

           if(userFound.isEmpty())
               throw new UsernameNotFoundException("Email not found");

           if(!encoder.matches(password, userFound.get().getPassword()))
               throw new Exception("Password is invalid");

           return userFound.get();
       } catch (Exception e) {
           throw new RuntimeException(e);
       }
    }
}
