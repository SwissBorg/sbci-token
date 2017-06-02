package com.swissborg;

import org.adridadou.ethereum.EthjEthereumFacadeProvider;
import org.adridadou.ethereum.ethj.TestConfig;
import org.adridadou.ethereum.propeller.EthereumFacade;
import org.adridadou.ethereum.propeller.keystore.AccountProvider;
import org.adridadou.ethereum.propeller.solidity.CompilationResult;
import org.adridadou.ethereum.propeller.solidity.SolidityContractDetails;
import org.adridadou.ethereum.propeller.values.EthAccount;
import org.adridadou.ethereum.propeller.values.EthAddress;
import org.adridadou.ethereum.propeller.values.EthValue;
import org.adridadou.ethereum.propeller.values.SoliditySourceFile;
import org.junit.Assert;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExpectedException;

import java.io.File;
import java.math.BigInteger;
import java.util.concurrent.ExecutionException;

import static junit.framework.TestCase.assertEquals;

/**
 * Created by mroon on 18.05.17.
 */
public class TokenFundTest {
    /*create two accounts to play with the contract*/
    EthAccount account1 = AccountProvider.fromSeed("titi1");
    EthAccount account2 = AccountProvider.fromSeed("titi2");
    EthereumFacade ethereumFacade = EthjEthereumFacadeProvider.forTest(TestConfig.builder()
            .balance(account1, EthValue.ether(1)) //initializing the balance for account1
            .balance(account2, EthValue.ether(1)) //initializing the balance for account2
            .gasPrice(0L) //setting the gasPrice to 0 allows to test ethBalance predictably
            .build());
    @Rule
    public final ExpectedException exception = ExpectedException.none();

    @Test
    public void testToken() throws ExecutionException, InterruptedException {
        CompilationResult compilationResult = ethereumFacade.compile(SoliditySourceFile.from(new File("src/contracts/swissborg.sol")));
        SolidityContractDetails tokenDetails = compilationResult.findContract("SwissBorgFund").get();
        EthAddress contractAddress = ethereumFacade
                /*constructor args: bytes8 name, bytes4 symbol, uint8 decimals, uint256 initialPriceInWei*/
                .publishContract(tokenDetails, account1, "TokenFund", "SBF", 1000000000000000000L).get();

        IFundToken tokenA1 = ethereumFacade.createContractProxy(tokenDetails, contractAddress, account1, IFundToken.class);
        IFundToken tokenA2 = ethereumFacade.createContractProxy(tokenDetails, contractAddress, account2, IFundToken.class);

        assertEquals("0", tokenA1.totalSupply().toString());
        assertEquals("0", tokenA1.balanceOf(account1.getAddress()).toString());

        assertEquals(18L, tokenA1._decimals().longValue());
        assertEquals(1000000000000000000L, tokenA1._unit().longValue());

        tokenA1.buy().with(EthValue.ether(1)).get();
        assertEquals("1000000000000000000", tokenA1.balanceOf(account1.getAddress()).toString());

        tokenA1.transfer(account2.getAddress(), new BigInteger("10")).get();
        assertEquals("10", tokenA1.balanceOf(account2.getAddress()).toString());

        tokenA2.buy().with(EthValue.wei(90)).get();
        assertEquals("100", tokenA1.balanceOf(account2.getAddress()).toString());

        try {
            tokenA1.buy().with(EthValue.wei(10)).get();
            Assert.fail(); //if the exception is not thrown the test shall fail
        } catch (ExecutionException ex) {
            Assert.assertEquals(ex.getClass(), ExecutionException.class);
        }

        assertEquals(EthValue.wei(new BigInteger("1000000000000000090")), ethereumFacade.getBalance(contractAddress));

        //calling payOut from an account that is not the owner will throw
        try {
            tokenA2.retrieveEther().get();
            Assert.fail(); //if the exception is not thrown the test shall fail
        } catch (ExecutionException ex) {
            Assert.assertEquals(ex.getClass(), ExecutionException.class);
        }

        assertEquals(EthValue.wei(new BigInteger("1000000000000000090")), ethereumFacade.getBalance(contractAddress));

        EthValue balance = ethereumFacade.getBalance(account1.getAddress());
        tokenA1.retrieveEther().get();
        assertEquals(EthValue.wei(0), ethereumFacade.getBalance(contractAddress));
        EthValue newBalance = ethereumFacade.getBalance(account1.getAddress());
        assertEquals(balance.plus(EthValue.wei(new BigInteger("1000000000000000090"))), newBalance);

        try {
            tokenA2.transferOwnership(account1).get();
            Assert.fail(); //if the exception is not thrown the test shall fail
        } catch (ExecutionException ex) {
            Assert.assertEquals(ex.getClass(), ExecutionException.class);
        }

        assertEquals(account1.getAddress(), tokenA1.owner());
        tokenA1.transferOwnership(account2).get();
        assertEquals(account2.getAddress(), tokenA1.owner());

    }
}
