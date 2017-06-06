package com.swissborg;

import org.adridadou.ethereum.propeller.values.EthAddress;
import org.adridadou.ethereum.propeller.values.EthValue;

import java.math.BigInteger;

/**
 * Created by mroon on 02.06.17.
 */
public class TransferEvent {
    private EthAddress _from;
    private EthAddress _to;
    private BigInteger _amount;

    public TransferEvent(EthAddress _from, EthAddress _to, BigInteger _amount) {
        this._from = _from;
        this._to = _to;
        this._amount = _amount;
    }

    public EthAddress get_from() {
        return _from;
    }

    public EthAddress get_to() {
        return _to;
    }

    public BigInteger get_amount() {
        return _amount;
    }
}
