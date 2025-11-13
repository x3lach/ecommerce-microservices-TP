package com.ecommerce.searchservice.config;


import com.ecommerce.searchservice.listener.ProductEventListener;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // These names must match the ones in catalogue-service
    public static final String EXCHANGE_NAME = "product.events";
    public static final String ROUTING_KEY_PRODUCT_CREATED = "product.created";

    @Bean
    public Queue productCreatedQueue() {
        // This creates the queue: "search.product.created"
        return new Queue(ProductEventListener.QUEUE_NAME);
    }

    @Bean
    public TopicExchange productEventsExchange() {
        // This just declares the exchange (it won't recreate it)
        return new TopicExchange(EXCHANGE_NAME);
    }

    @Bean
    public Binding productCreatedBinding(Queue productCreatedQueue, TopicExchange productEventsExchange) {
        // This "binds" the queue to the exchange
        // It tells RabbitMQ: "Send any message from 'product.events'
        // with routing key 'product.created' to my 'search.product.created' queue."
        return BindingBuilder.bind(productCreatedQueue)
                .to(productEventsExchange)
                .with(ROUTING_KEY_PRODUCT_CREATED);
    }

    // We need this on the receiving side too,
    // to deserialize the JSON back into our DTO
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}