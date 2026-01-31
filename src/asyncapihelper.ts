import _ from 'lodash';
import YAML from 'js-yaml';



export class AsyncAPIHelper {
  getContentType(apiSpec: string): string {
    try {
      const o = JSON.parse(apiSpec);
      if (o && typeof o === "object") {
        return "application/json";
      } else {
        return "application/x-yaml";
      }
    }
    catch (e) {
      return "application/x-yaml";
    }
  }

  YAMLtoJSON(apiSpec: string): string {
    if (this.getContentType(apiSpec) == "application/x-yaml") {
      const o = YAML.load(apiSpec, { schema: YAML.DEFAULT_SCHEMA });
      return JSON.stringify(o);
    } else {
      throw new Error("Invalid YAMl");
    }
  }
  JSONtoYAML(apiSpec: string): string {
    if (this.getContentType(apiSpec) == "application/json") {
      const o = JSON.parse(apiSpec);
      return YAML.dump(o);
    } else {
      throw new Error("Invalid JSON");
    }
  }
  YAMLtoObject(apiSpec: string): any {
    if (this.getContentType(apiSpec) == "application/x-yaml") {
      const o = YAML.load(apiSpec);
      return o;
    } else {
      throw new Error("Invalid YAMl");
    }
  }

  public async decorateSAPCECompliantSpec(r: any): Promise<any> {
    let o: any = r;
    const isString: boolean = _.isString(r);
    if (isString) {
      if (this.getContentType(r) == "application/x-yaml") {
        o = this.YAMLtoObject(r);
      } else {
        try {
          o = JSON.parse(r);
        } catch (e) {
          console.log(e);
          throw new Error('Failed to parse AsyncAPI specification for SAP decoration: ' + e.message);
        }
      }
    }
    if (!o['x-sap-catalog-spec-version']) {
      o['x-sap-catalog-spec-version'] = '1.0';
      o['x-sap-api-type'] = 'EVENT';
      o['x-sap-shortText'] = o.info.title;
    }
    if (o.components?.messages) {
      for (const [key, value] of Object.entries(o.components.messages)) {
        const properties =
        {
          type:
          {
            const: _.replace(key, /_/g, ".")
          },
          datacontenttype:
          {
            const: value['contentType'] ? value['contentType'] : "application/json"
          },
          specversion:
          {
            description: "The version of the CloudEvents specification which the event uses. This enables the interpretation of the context.",
            type: "string",
            const: "1.0"
          },
          source:
          {
            description: "This describes the event producer.",
            type: "string",
            format: "uri-reference"
          },
          id:
          {
            description: "ID of the event.",
            type: "string",
            minLength: 1,
            examples:
              [
                "6925d08e-bc19-4ad7-902e-bd29721cc69b"
              ]
          },

        }
        if (!value['headers']) {
          value['headers'] = {
          }
        };
        if (!value['headers'].properties) {
          value['headers'] = {
            properties: {}
          }
        };
        const newProperties = value['headers']?.properties ? _.merge(value['headers'].properties, properties) : properties;
        value['headers'].properties = newProperties;
      }

    }
    if (isString) {
      r = JSON.stringify(o);
    }
    return r;
  }


}

export default new AsyncAPIHelper();
