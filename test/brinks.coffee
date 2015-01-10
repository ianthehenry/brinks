brinks = require 'brinks/index'
{ assert } = require 'chai'

describe "brinks", ->
  it "should be excited", ->
    assert brinks == "brinks!"
