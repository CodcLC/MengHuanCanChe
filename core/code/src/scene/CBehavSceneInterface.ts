namespace ClientCore {
    export class CBehavSceneInterface extends Share.CUnitBehavior {
        private m_oBehavScene:Share.CBehavScene;

        public constructor(s: Share.CUnit) {
            super(s);
        }

        get OnEnter(){
            return this.m_oBehavScene.OnEnter;
        }

        get OnLeave(){
            return this.m_oBehavScene.OnLeave;
        }

        protected _awake() {
            this.m_oBehavScene = this.getComponent(Share.CBehavScene);
        }

    }
}