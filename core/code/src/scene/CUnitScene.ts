namespace ClientCore{
    export class CUnitScene extends Share.CUnit{
        private m_oBehavScene: Share.CBehavScene;

        get BehavScene(){
            return this.m_oBehavScene;
        }

        constructor(){
            super(Share.CUBC(Share.CBehavTimerMgr), [Share.CUBC(Share.CBehavScene), Share.CUBC(CBehavSceneInterface)]);
            this.m_oBehavScene = this.getComponent(Share.CBehavScene);
        }
    }
}