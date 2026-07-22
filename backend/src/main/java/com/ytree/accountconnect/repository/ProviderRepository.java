package com.ytree.accountconnect.repository;

import com.ytree.accountconnect.model.Provider;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class ProviderRepository {
    private final List<Provider> providers = List.of(
            new Provider("barclays", "Barclays"),
            new Provider("fidelity", "Fidelity"),
            new Provider("halifax", "Halifax"),
            new Provider("hsbc", "HSBC"),
            new Provider("lloyds", "Lloyds Bank"),
            new Provider("monzo", "Monzo"),
            new Provider("natwest", "NatWest"),
            new Provider("santander", "Santander"),
            new Provider("vanguard", "Vanguard")
    );

    public List<Provider> findAll() {
        return providers;
    }

    public Optional<Provider> findById(String id) {
        return providers.stream()
                .filter(provider -> provider.id().equals(id))
                .findFirst();
    }
}
