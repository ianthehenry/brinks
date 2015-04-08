data = require 'brinks'
{ assert } = require 'chai'

they = it
ignore = (->)

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
      assert NumList.Nil() instanceof NumList
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

    they "work", ->
      { Nil, Cons } = List(Number)
      list = Cons(10, Cons(20, Nil()))
      assert list.get(0) == 10

    they "work for weird non-fully-recursive types", ->
      FunList = data (a, b) ->
        Nil: []
        Cons: [[a, b], this(b, a)]

      { Nil, Cons } = FunList(Number, String)
      { Cons: AltCons } = FunList(String, Number)

      list = Cons([1, 'foo'], AltCons(['bar', 2], Nil))

      assert list.get(0)[0] == 1
      assert list.get(0)[1] == 'foo'
      assert list.get(1).get(0)[0] == 'bar'

    they "instanceof well", ->
      numList = List(Number)
      assert numList.Nil() instanceof numList
      assert numList.Cons(10, numList.Nil()) instanceof numList

    they "type check", ->
      { Nil, Cons } = List(Number)
      assert.throws -> Cons(10, Cons("20", Nil))

    they "require the right number of arguments", ->
      assert.throws -> List(Number, String)
      assert.throws -> List()
