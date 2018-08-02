namespace API {

  export interface IPackageJSON extends Object {
    name                  : string;
    version?              : string;
    description?          : string;
    keywords?             : string[];
    homepage?             : string;
    bugs?                 : string | IBugs;
    license?              : string;
    author?               : string | IAuthor;
    contributors?         : string[] | IAuthor[];
    files?                : string[];
    main?                 : string;
    bin?                  : string | IBinMap;
    man?                  : string | string[];
    directories?          : IDirectories;
    repository?           : string | IRepository;
    scripts?              : IScriptsMap;
    config?               : IConfig;
    dependencies?         : IDependencyMap;
    devDependencies?      : IDependencyMap;
    peerDependencies?     : IDependencyMap;
    optionalDependencies? : IDependencyMap;
    bundledDependencies?  : string[];
    engines?              : IEngines;
    os?                   : string[];
    cpu?                  : string[];
    preferGlobal?         : boolean;
    private?              : boolean;
    publishConfig?        : IPublishConfig;
  }

  export interface IAuthor {
    name      : string;
    email?    : string;
    homepage? : string;
  }

  export interface IBinMap {
    [commandName: string] : string;
  }

  export interface IBugs {
    email : string;
    url   : string;
  }

  export interface IConfig {
    name?   : string;
    config? : Object;
  }

  export interface IDependencyMap {
    [dependencyName: string] : string;
  }

  export interface IDirectories {
    lib?     : string;
    test?    : string;
    man?     : string;
    doc?     : string;
    example? : string;
  }

  export interface IEngines {
    node? : string;
    npm?  : string;
  }

  export interface IPublishConfig {
    registry? : string;
  }

  export interface IRepository {
    type : string;
    url  : string;
  }

  export interface IScriptsMap {
    [scriptName: string] : string;
  }

}
