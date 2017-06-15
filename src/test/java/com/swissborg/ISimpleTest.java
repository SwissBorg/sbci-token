package com.swissborg;

import java.util.concurrent.CompletableFuture;

/**
 * Created by mroon on 15.06.17.
 */
public interface ISimpleTest {
    CompletableFuture<Void> myFunction();
}
