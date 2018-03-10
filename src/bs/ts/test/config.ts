import { Config } from "../Config"

// Attempt to read in a config file and print its contents
(async()=>{
    let config = Config.LoadConfig("../../config.yaml");
    console.log(config);
})();
