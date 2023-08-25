export default class CClientInstance{
    private m_oClientCore:ClientCore.CBehavClientCore
    private m_oSessionInterface: ClientCore.CBehavClientSessionInterface;

    public get ClientCore(){
        return this.m_oClientCore;
    }

    public get AccountSession(){
        return this.m_oSessionInterface;
    }

    public create(): ClientCore.CBehavClientCore{
        this.m_oClientCore = new ClientCore.CUnitClientCore().ClientCore;
        return this.m_oClientCore;
    }

    public createAccountSession():ClientCore.CBehavClientSessionInterface{
        this.m_oSessionInterface = this.m_oClientCore.CreateAccountSession();
        return this.m_oSessionInterface;
    }
}