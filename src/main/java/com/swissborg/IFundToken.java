package com.swissborg;

import org.adridadou.ethereum.propeller.values.EthAccount;
import org.adridadou.ethereum.propeller.values.EthAddress;
import org.adridadou.ethereum.propeller.values.EthValue;
import org.adridadou.ethereum.propeller.values.Payable;

import java.math.BigInteger;
import java.util.concurrent.CompletableFuture;

/**
 * Created by mroon on 18.05.17.
 */
public interface IFundToken {

    EthAddress owner();

    BigInteger priceInWei();

    BigInteger balanceOf(EthAddress addr);

    BigInteger totalSupply();

    Payable<Void> buy();

    CompletableFuture<Boolean> transfer(EthAddress to, BigInteger amount);

    CompletableFuture<Void> retrieveEther();

    BigInteger _unit();

    BigInteger _decimals();

    CompletableFuture<Void> transferOwnership(EthAccount newOwner);
}
