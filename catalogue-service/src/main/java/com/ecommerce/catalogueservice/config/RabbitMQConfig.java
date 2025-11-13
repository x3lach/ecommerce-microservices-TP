package com.ecommerce.catalogueservice.config;


import org.springframework.amqp.core.Binding; // <-- Add
import org.springframework.amqp.core.BindingBuilder; // <-- Add
import org.springframework.amqp.core.Queue; // <-- Add
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // --- Product Exchange (from before) ---
    public static final String PRODUCT_EXCHANGE_NAME = "product.events";
    public static final String ROUTING_KEY_PRODUCT_CREATED = "product.created";

    @Bean
    public TopicExchange productEventsExchange() {
        return new TopicExchange(PRODUCT_EXCHANGE_NAME);
    }

    // --- NEW: Order Exchange Config ---
    public static final String ORDER_EXCHANGE_NAME = "order.events";
    public static final String ROUTING_KEY_ORDER_CREATED = "order.created";
    public static final String QUEUE_NAME_ORDER_CREATED = "catalogue.order.created";

    @Bean
    public Queue orderCreatedQueue() {
        // Creates the queue "catalogue.order.created"
        return new Queue(QUEUE_NAME_ORDER_CREATED);
    }

    @Bean
    public TopicExchange orderEventsExchange() {
        // Declares the exchange (must match the one in commande-service)
        return new TopicExchange(ORDER_EXCHANGE_NAME);
    }

    @Bean
    public Binding orderCreatedBinding(Queue orderCreatedQueue, TopicExchange orderEventsExchange) {
        // Binds our queue to the order.events exchange
        return BindingBuilder.bind(orderCreatedQueue)
                .to(orderEventsExchange)
                .with(ROUTING_KEY_ORDER_CREATED);
    }
    // --- END NEW ---

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}