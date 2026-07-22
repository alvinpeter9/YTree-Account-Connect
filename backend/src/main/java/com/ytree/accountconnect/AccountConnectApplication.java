package com.ytree.accountconnect;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import java.time.Clock;

@SpringBootApplication
public class AccountConnectApplication {
    public static void main(String[] args) { SpringApplication.run(AccountConnectApplication.class, args); }
    @Bean Clock clock() { return Clock.systemUTC(); }
}

