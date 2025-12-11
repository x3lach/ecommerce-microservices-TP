package org.example.userservice.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.ToString;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.UUID;

@Entity
@Table(name = "addresses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    @ToString.Exclude
    private User user;

    private String addressLine1;
    private String city;
    private String postalCode;
    private String country;

    @Column(name = "is_default")
    private Boolean isDefault = false;

    private String label; // e.g., "Home", "Work", "Other"
}

