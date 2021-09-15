// test/index.js

const path = require("path");

function get_user(service,req,res) {
  service.render(req,res,"User","user",{});
}

function get_drive(service,req,res) {
  service.render(req,res,"Drive","drive",{});
}

module.exports = {
  title: "Graph Layer Components",

  static: [
    ["/graph-layer-components/assets",path.join(__dirname,"./public")]
  ],

  templatePath: path.join(__dirname,"./templates"),

  routes: [
    ["/graph-layer-components/userinfo",get_user,"User"],
    ["/graph-layer-components/drive",get_drive,"Drive"]
  ],

  assets: {
    scripts: [
      "/graph-layer-components/assets/test.js"
    ],
    styles: [
      "/graph-layer-components/assets/test.css"
    ]
  }
};
