package com.ytree.accountconnect.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class SubmissionIntegrationTest {
    @Autowired
    private MockMvc mvc;

    @Test
    void seededIncompleteAccountsCannotBeSubmitted() throws Exception {
        mvc.perform(post("/api/submissions"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("ACCOUNTS_NOT_READY"))
                .andExpect(jsonPath("$.message").value("Every provider needs a current statement."))
                .andExpect(jsonPath("$.details[0]").value("HSBC: missing"))
                .andExpect(jsonPath("$.details[1]").value("Vanguard: outdated"));
    }
}
