// Reuse Next's existing SWC compiler to package shared financial models for a vanilla browser widget.
module.exports = function(source) {
  const done=this.async();
  require('next/dist/build/swc').transform(source,{filename:this.resourcePath,jsc:{parser:{syntax:'typescript'},target:'es2020'},module:{type:'es6'}})
    .then(result=>done(null,result.code),done);
};
