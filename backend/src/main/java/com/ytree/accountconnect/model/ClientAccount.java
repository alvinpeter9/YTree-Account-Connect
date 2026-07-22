package com.ytree.accountconnect.model;

public record ClientAccount(String id, Provider provider, Statement statement) {
    public ClientAccount withStatement(Statement value) {
        return new ClientAccount(id, provider, value);
    }
}
