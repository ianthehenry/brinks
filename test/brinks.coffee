data = require 'brinks'
{ assert } = require 'chai'

they = it

describe "data", ->
  NumList = data ->
    Nil: []
    Cons: [Number, this]

  describe "types", ->
    NumBox = data -> Value: [Number]
    it "will fail if invoked with the wrong type", ->
      assert.doesNotThrow -> NumBox.Value(123)
      assert.throws -> NumBox.Value("hello")

  describe "value constructors", ->
    they "can be invoked with or without the new keyword", ->
      assert (new NumList.Cons(10, NumList.Nil())).get(0) == NumList.Cons(10, NumList.Nil()).get(0)

  describe "values", ->
    list = NumList.Cons(10, NumList.Cons(20, NumList.Nil()))

    they "are instances of types", ->
      assert NumList.Cons(10, NumList.Nil()) instanceof NumList

    they "are instances of value constructors", ->
      assert NumList.Cons(10, NumList.Nil()) instanceof NumList.Cons

    they "have field-selecting functions", ->
      assert list.get(0) == 10

    they "have functions that return all values when invoked with no arguments", ->
      [head, tail] = list.get()
      assert head == 10
      assert tail.get(0) == 20
      assert tail.get(1) instanceof NumList.Nil

  describe "type constructors", ->
    List = data (a) ->
      Nil: []
      Cons: [a, this(a)]

    describe "types", ->
      they "are instances of type constructors", ->
        assert List(10) instanceof List
