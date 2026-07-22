package com.ytree.accountconnect.controller;

import com.ytree.accountconnect.exception.ApiException;
import com.ytree.accountconnect.service.AccountService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpStatus;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.doThrow;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AccountController.class)
class SubmissionApiTest {
    @Autowired
    private MockMvc mvc;

    @MockBean
    private AccountService accountService;

    @Test
    void incompleteSubmissionReturnsAUsefulConflictResponse() throws Exception {
        doThrow(new ApiException(
                HttpStatus.CONFLICT,
                "ACCOUNTS_NOT_READY",
                "Every provider needs a current statement.",
                List.of("HSBC: missing")
        )).when(accountService).submit();

        mvc.perform(post("/api/submissions"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("ACCOUNTS_NOT_READY"))
                .andExpect(jsonPath("$.details[0]").value("HSBC: missing"));
    }
}
