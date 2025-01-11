package com.rica.invoice_ease.service;

import com.rica.invoice_ease.model.User;
import com.rica.invoice_ease.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.util.Streamable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User createUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public boolean authenticate(String username, String password) {
        Optional<User> user = findByUsername(username);
        return user.map(u -> passwordEncoder.matches(password, u.getPassword())).orElse(false);
    }

    public List<User> getAllUsers() {
        List<User> users = new ArrayList<>();

        Streamable.of(userRepository.findAll()).forEach(users::add);

        return users;
    }
}
