package com.ecommerce.commandeservice.config;


import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class AppConfig {

    /**
     * Creates a RestTemplate bean.
     * The @LoadBalanced annotation is magic: it tells this RestTemplate
     * to use Eureka to find other services. We can use service names
     * (like "http://catalogue-service/") instead of hard-coded ports.
     */
    @Bean
    @LoadBalanced
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}