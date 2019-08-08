/**
 * @name Reroll-Initiative
 * @version 0.4
 * @author Evan Clarke <errational>
 * @description Rerolls initiative on combat round change
 */

/**
 * @class RerollInitiative
 * @description Hooks on combat update and rerolls initiative for all combatants depending on current value of setting
 * @todo Add configurability for whom to reroll, make enable setting define whether the hook is registered or not??
 */
class RerollInitiative {

    constructor() {
        /**
         * Initialize object to hold the config for this instance
         */
        this.config = {};

        /**
         * Register settings with 
         */
        this._registerSettings();
        this._loadSettings();
        this._postUpdateCombatHook();
    }

    /**
     * Define the default config for the module. Restricted to get only
     */
    static get DEFAULT_CONFIG() {
        return {
            reroll: true,
            actorTypes: "all"
        };
    }

    /**
     * Define the settings metadata for the module. Restricted to get only
     */
    static get SETTINGS(){
        return {
            module: "reroll-initiative",
            key: "rriSettings",
            name: "Reroll-Initiative Settings",
            hint: "Settings for Reroll-Initiative module",
            default: RerollInitiative.DEFAULT_CONFIG,
            scope: "world"
        };
    }

    /**
     * Register module settings with game settings
     * @todo: Add any steps to occur when settings change
     */
    _registerSettings () {
        game.settings.register(RerollInitiative.SETTINGS.module, RerollInitiative.SETTINGS.key, {
            name: RerollInitiative.SETTINGS.name,
            hint: RerollInitiative.SETTINGS.hint,
            default: RerollInitiative.SETTINGS.default,
            type: Object,
            scope: RerollInitiative.SETTINGS.scope,
            onChange: options => {
                console.log("Module settings changed, new option values: ",options)
            }
        });
    }

    /**
     * Resets settings back to default
     * @todo: maybe expand this to deregister and register settings
     */
    _applydefaultConfig() {
        this.options = RerollIinitiative.DEFAULT_CONFIG;
        console.log("Resetting reroll-initiative settings to defaults:",RerollInitiative.DEFAULT_OPTIONS);
        this._saveSettings();
    }

    /**
     * Saves current class instance options back to game settings
     */
    async _saveSettings () {
        await game.settings.set(RerollInitiative.SETTINGS.module,RerollInitiative.SETTINGS.key,this.settings);
    }

    /**
     * Loads current class instance settings from game settings
     */
    async _loadSettings (){
        let config = await game.settings.get(RerollInitiative.SETTINGS.module,RerollInitiative.SETTINGS.key);
        this.config = config;
        console.log(this.config);
    }
    
    /**
     * Update a single setting
     * @param {String} option The setting option to change
     * @param {*} value The new value of the option
     */
    updateSetting(option,value){
        if(this.options.hasOwnProperty(option)){
            console.log(option);
            this.options[option] = value;
            this._saveSettings();
        }
        else{
            console.exception("Module setting option: "+option+" does not exist!");
        }
    }

    /**
     * Hook on combat update and if round in update is greater than previous -- call resetAndReroll
     */
    _postUpdateCombatHook() {
        Hooks.on("updateCombat", (combat,update) =>  {
            this._loadSettings();

            if(this.config.reroll){
                
                if(update.round && combat.previous && update.round > combat.previous.round){
                    //console.log("Reroll-Initiative: Round incremented - rerolling initiative")
                    this.resetAndReroll(combat);
                }
            }
            else {
                Console.log("Rerolling Initiative is currently turned off")
            }
            
        }); 
    }

    /**
     * @name resetAndReroll
     * @param {Combat} combat
     * @description For the given combat instance, call the resetAll method and the rollAll method
     * @todo Not sure if this should be marked private...
     */
    async resetAndReroll(combat){
        await combat.resetAll();
        combat.rollAll();
    }
}

/**
 * @class RerollInitiativeConfig
 * @description Handles the configuration form for the module. Currently inserts within Combat Tracker Config
 * @
 */
class RerollInitiativeConfig {

    constructor(){
        this.rri = {};
        this._hookRenderCombatTrackerConfig();
    }    

    /**
     * Hooks on the render of combat tracker config and insert the module config
     */
    _hookRenderCombatTrackerConfig(){
        Hooks.on("renderCombatTrackerConfig", (app, html) => {

            const settings = this._loadSettings();

            if(html){
                this._injectCheckbox(html);
            }

            
            
                // Adjust the window height
                app.setPosition({height: app.position.height + 60});
        
                // Handle form submission
                const form = submit.parent();
                form.on("submit", ev => {
                    let rriCheckboxValue = rriCheckbox.prop("checked");
                    console.log("submit", ev);
                    console.log("rriCheckbox is: ",rriCheckbox.prop("checked"));
                    //grab the value of the rriCheckbox and send a call to the RerollInitiaitive class to update settings accordingly;
                    //this.rri.updateOption("reroll", rriCheckboxValue);
                    game.settings.set(RerollInitiative.SETTINGS.module,RerollInitiative.SETTINGS.key,)
                
                });
                    
            
        })
    }

    /**
     * Injects a checkbox inside the designated element
     * @param {*} html
     * @returns {Object} checkbox The checkbox element that was injected
     */
    _injectCheckbox(html){
        //name of the checkbox to be injected
        const nextElementIdentifier = 'button[type="submit"]';
        const name = "rerollInitiative";
        const hint = "Reroll Initiative for all combatants each round"

        let nextElement = html.find(nextElementIdentifier);
        
        nextElement.before(
              `<hr/>
              <div class="form-group">
                  <label>Reroll Initiative</label>
                  <input type="checkbox" name=${name} data-dtype="Boolean">
                  <p class=hint>${hint}</p>
              </div>`
            );
            console.log(html);
        //Find the checkbox that was just created
        if(html.find('input[name="rerollInitiative"]')){
            let checkbox = html.find('input[name="rerollInitiative"]');
            
            //Set the state of the checkbox to match the current value of the "reroll" setting
            rriCheckbox.prop("checked",settings.reroll);
            console.log(rriCheckbox);
        }
        else {
            console.log("Couldn't find reroll-initiative checkbox.");
        }   

        return this._injectCheckbox;
    }

    async _loadSettings() {
        let settings = await game.settings.get[RerollInitiative.SETTINGS.module,RerollInitiative.SETTINGS.key];
        return settings;
    }
}

/**
 * Hook on game ready and instantiate the main module class
 */
Hooks.on("ready", ()=> {
    const MODULE_NAME = "reroll-initiative"

    //instantiate RerollInitiative under game global var
    game[MODULE_NAME] = {
        rri: new RerollInitiative(),
        rriConfig: new RerollInitiativeConfig()
    }
    console.log(game[MODULE_NAME]);
});