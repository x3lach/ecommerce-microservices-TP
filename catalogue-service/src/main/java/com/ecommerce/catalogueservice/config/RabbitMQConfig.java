package com.ecommerce.catalogueservice.config;

import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // As defined in the specs
    public static final String EXCHANGE_NAME = "product.events";
    public static final String ROUTING_KEY_PRODUCT_CREATED = "product.created";

    @Bean
    public TopicExchange productEventsExchange() {
        return new TopicExchange(EXCHANGE_NAME);
    }

    // --- ADD THIS NEW BEAN ---
    /**
     * This bean tells Spring to use a JSON converter for RabbitMQ messages.
     * This will automatically serialize our DTOs (like ProductCreatedEvent) to JSON
     * and deserialize them back on the consumer side.
     */
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
    // --- END NEW BEAN ---
}