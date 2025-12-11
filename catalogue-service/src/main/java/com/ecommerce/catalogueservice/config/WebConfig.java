package com.ecommerce.catalogueservice.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Use parent directory to serve uploads from project root level
        Path uploadDir = Paths.get(System.getProperty("user.dir")).getParent().resolve("uploads");
        String uploadPath = uploadDir.toFile().getAbsolutePath();

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:/" + uploadPath + "/");
    }

    // CORS is handled by the API Gateway - do not add CORS config here
    // to avoid duplicate 'Access-Control-Allow-Origin' headers
}
