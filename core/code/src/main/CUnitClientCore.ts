namespace ClientCore {
    export class CUnitClientCore extends Share.CUnit {
        private m_oClientCore: CBehavClientCore;

        public constructor() {
            super(Share.CUBC(CBehavClientCore));
            this.m_oClientCore = this.getComponent(CBehavClientCore);
        }

        public get ClientCore() {
            return this.m_oClientCore;
        }
    }
}