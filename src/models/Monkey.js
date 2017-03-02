import Configuration from './Configuration';
import Repository from './Repository';

class Monkey {

    constructor(rawConfigurations, scope) {
        this.scope = scope;
        this.repository = new Repository({});
        this.configurations = rawConfigurations.map((rawConfig) => {
            var config = new Configuration(rawConfig.content, this.repository, rawConfig.enabled, rawConfig.values);
            this.repository.addConfiguration(rawConfig.name, config);
            return [rawConfig.name, config];
        });

    }

    apply(configuration) {
        var text,
            texts = this.scope.document.evaluate('//body//text()[ normalize-space(.) != ""]', this.scope.document, null, 6, null);
        for (var i = 0; (text = texts.snapshotItem(i)) !== null; i += 1) {
            configuration.apply(text, "data");
        }
        configuration.apply(this.scope.document, "title");
    }

    run(configuration) {
        return this.scope.setInterval(() => this.apply(configuration), 100);
    }

    start() {
        this.intervals = this.runAll();
    }

    stop() {
        this.intervals.forEach((interval) => {
            this.scope.clearInterval(interval);
        });
    }

    restart() {
        stop( );
        start();
    }

    runAll() {
        return this.configurations.reduce((result, cfg) => {

            var name = cfg[0];
            var configuration = cfg[1];

            if (configuration.isEnabledForUrl(this.scope.location.href)) {
                result.push(this.run(configuration));
            }

            return result;
        }, []);
    }

}

export default Monkey
