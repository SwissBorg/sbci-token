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
import org.junit.Assert;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExpectedException;
import rx.Observable;

import java.io.File;
import java.math.BigInteger;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;

import static junit.framework.TestCase.assertEquals;
import static junit.framework.TestCase.assertNotNull;

/**
 * Created by mroon on 18.05.17.
 */
public class MyEventTest {

    /*create two accounts to play with the contract*/
    EthAccount account1 = AccountProvider.fromPrivateKey("efc73898fc9bbc6c315c94cd5c57e5f67ad05145fd24713f5a533dfa163470c3");

    EthereumFacade ethereumFacade = null;

    @Before
    public void before() {
        ethereumFacade = EthjEthereumFacadeProvider.forTest(TestConfig.builder()
                .balance(account1, EthValue.ether(1)) //initializing the balance for account1
                .gasPrice(0L) //setting the gasPrice to 0 allows to test ethBalance predictably
                .build());
    }

    @Rule
    public final ExpectedException exception = ExpectedException.none();

    @Test
    public void testTriggerEvent() throws ExecutionException, InterruptedException {

        CompilationResult compilationResult = ethereumFacade.compile(SoliditySourceFile.from(new File("src/contracts/simple.sol")));
        SolidityContractDetails simpleTest = compilationResult.findContract("SimpleTest").get();
        EthAddress contractAddress = ethereumFacade
                .publishContract(simpleTest, account1).get();

        ISimpleTest test1 = ethereumFacade.createContractProxy(simpleTest, contractAddress, account1, ISimpleTest.class);

        SolidityEvent<MyEvent> eventDef = ethereumFacade.findEventDefinition(simpleTest, "MyEvent", MyEvent.class).get();
        Observable<MyEvent> observeTransfers = ethereumFacade.observeEvents(eventDef, contractAddress);

        test1.myFunction().get();
        MyEvent transferEvent = observeTransfers.toBlocking().first();
        assertNotNull(transferEvent);
    }
}
