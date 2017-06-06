package com.swissborg;

import org.adridadou.ethereum.EthjEthereumFacadeProvider;
import org.adridadou.ethereum.RpcEthereumFacadeProvider;
import org.adridadou.ethereum.ethj.TestConfig;
import org.adridadou.ethereum.propeller.EthereumFacade;
import org.adridadou.ethereum.propeller.keystore.AccountProvider;
import org.adridadou.ethereum.propeller.solidity.CompilationResult;
import org.adridadou.ethereum.propeller.solidity.SolidityContractDetails;
import org.adridadou.ethereum.propeller.solidity.SolidityEvent;
import org.adridadou.ethereum.propeller.values.*;
import org.adridadou.ethereum.rpc.EthereumRpcConfig;
import org.junit.*;
import org.junit.rules.ExpectedException;
import rx.Observable;

import java.io.File;
import java.math.BigInteger;
import java.util.concurrent.ExecutionException;

import static junit.framework.TestCase.assertEquals;
import static junit.framework.TestCase.assertNotNull;

/**
 * Created by mroon on 18.05.17.
 */
public class TokenFundTest {
    private enum TestModes {ETHJ, TESTRPC, KOVAN};
    private static final TestModes testMode = TestModes.TESTRPC;

    /*create two accounts to play with the contract*/
    EthAccount account1 = AccountProvider.fromPrivateKey("efc73898fc9bbc6c315c94cd5c57e5f67ad05145fd24713f5a533dfa163470c3");
    EthAccount account2 = AccountProvider.fromPrivateKey("a5119ff109d2886e358cf7712feb98fb8b16db5029273a435b7e2b131b9fd8fe");
    EthAccount account3 = AccountProvider.fromPrivateKey("38712cee7ace9c96181cc6a31f55fac50b3ff005d7c1bfa0c3a0121c8fc4b1c2");
    EthAccount account4 = AccountProvider.fromPrivateKey("59983eb3692f525def24c283b775973112d67d30589fa63798dfd70cea82467d");

    EthereumFacade ethereumFacade = null;

    @Before
    public void before() {
        if(testMode.equals(TestModes.ETHJ)){
            ethereumFacade = EthjEthereumFacadeProvider.forTest(TestConfig.builder()
                    .balance(account1, EthValue.ether(1)) //initializing the balance for account1
                    .balance(account2, EthValue.ether(1)) //initializing the balance for account2
                    .gasPrice(0L) //setting the gasPrice to 0 allows to test ethBalance predictably
                    .build());
        }

        if(testMode.equals(TestModes.TESTRPC)){
            ethereumFacade = RpcEthereumFacadeProvider.forRemoteNode("http://localhost:8585", new ChainId(16),
                    new EthereumRpcConfig(true, 1000, "", 1000));
        }


    }

    @Rule
    public final ExpectedException exception = ExpectedException.none();

    @Test
    public void testToken() throws ExecutionException, InterruptedException {
//        assertEquals(EthValue.ether(1000), ethereumFacade.getBalance(account1));

        CompilationResult compilationResult = ethereumFacade.compile(SoliditySourceFile.from(new File("src/contracts/swissborg.sol")));
        SolidityContractDetails tokenDetails = compilationResult.findContract("SwissBorgFund").get();
        EthAddress contractAddress = ethereumFacade
                /*constructor args: bytes8 name, bytes4 symbol, uint8 decimals, uint256 initialPriceInWei*/
                .publishContract(tokenDetails, account1, "TokenFund", "SBF", 1000000000000000000L).get();

        IFundToken tokenA1 = ethereumFacade.createContractProxy(tokenDetails, contractAddress, account1, IFundToken.class);
        IFundToken tokenA2 = ethereumFacade.createContractProxy(tokenDetails, contractAddress, account2, IFundToken.class);

        assertEquals("0", tokenA1.totalSupply().toString());
        assertEquals("0", tokenA1.balanceOf(account1.getAddress()).toString());

        /*****/
        SolidityEvent<TransferEvent> eventDef = ethereumFacade.findEventDefinition(tokenDetails, "Transfer", TransferEvent.class).get();
        Observable<TransferEvent> observeTransfers = ethereumFacade.observeEvents(eventDef, contractAddress);

        tokenA1.triggerTransferEvent().get();
        TransferEvent transferEvent = observeTransfers.toBlocking().first();
        assertNotNull(transferEvent);
        /*****/

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
