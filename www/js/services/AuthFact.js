angular.module('firstlife.factories')
    .factory('AuthFactory', ['myConfig', 'MemoryFactory', function(myConfig, MemoryFactory) {


        //C: (P&(~Q))
        
        return {
            checkPerms: function(source){
                
                var checkPerms = {};
                for(a in actions){
                    checkPerms[a] = checkAction(a,source,perms,actions);
                }
                console.log("AuthFactory, perms ",source,perms,actions,checkPerms);
                return checkPerms;
            },
            
            checkPerm: function(action,source){
                console.log("AuthFactory, perm ",action,source,perms,actions);
                
                return checkAction(action,source,perms,actions);
            },
        };

        
        function checkAction (action,source,perms,actions){
                
                var index = 2;
                switch(source){
                    case 'self':
                        index = 0;
                        break;
                    case 'group':
                        index = 1;
                        break;
                    default:
                        index = 2;
                }
                var mask = perms[index];
                //console.log("authFactory, checkPerms, action e source ",action,source,mask);
                //console.log("Result (P&(notQ)) ",self.actions[action],(mask), (self.actions[action]&(mask)));
                
                return (actions[action]&(~mask));
        }
        
    }]).run(function(myConfig){
    // conversione da decimale a binario
        function dec2bin(dec){
            return (parseInt(dec) >>> 0).toString(2);
        }

    self.perms = [];
    self.perms[0]    = dec2bin(~(myConfig.behaviour.umask.toString()[0])).slice(-3);
    self.perms[1]    = dec2bin(~(myConfig.behaviour.umask.toString()[1])).slice(-3);
    self.perms[2]    = dec2bin(~(myConfig.behaviour.umask.toString()[2])).slice(-3);
    self.actions = {r:'100',u:'010',d:'001'};
    console.log("authFactory, checkPerms, run ",myConfig.behaviour.umask, self.perms, self.actions);
});