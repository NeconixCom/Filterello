var Promise = TrelloPowerUp.Promise

Filterello = {

  //
  // Flags module
  //

  Flags: {

    getBoardButtons: function (t, options) {
      return Promise.resolve([
        {
          icon: './images/flag-white-icon.svg',
          text: 'Flagged',
          callback: function (t, options) {
            return Filterello.Flags._getFlaggedCards(t)
            .then(function (cards) {
              var items = []

              if (cards) {
                var createItemFromCard = (function (card) {
                  var cardName = card.name
                  var cardId = card.id

                  var item = {
                    text: cardName,
                    callback: function (t, options) {
                      t.showCard(cardId)
                    }
                  }

                  return item
                })

                for (var i = 0; i < cards.length; i++) {
                  var card = cards[i]

                  if (card) {
                    var item = createItemFromCard(card)

                    items.push(item)
                  }
                }
              }

              var maxItems = 10

              if (items.length > maxItems) {
                var moreResultsItemText = "View All (showing 10 of " + cards.length + ")"
 
                var moreResultsItem = {
                  text: moreResultsItemText,
                  alwaysVisible: true,
                  callback: function (t, options) {
                    maxItems = 1000

                    items.pop()
                    t.closePopup()

                    return t.popup({
                      title: 'Flagged',
                      items: items,
                      search: {
                        count: maxItems,
                        placeholder: 'Search flagged cards',
                        empty: 'No flagged cards'
                      }
                    })
                  }
                }

                items.push(moreResultsItem)
              }

              t.closePopup()

              return t.popup({
                title: 'Flagged',
                items: items,
                search: {
                  count: maxItems,
                  placeholder: 'Search flagged cards',
                  empty: 'No flagged cards'
                }
              })
            })
          }
        }
      ])
    },

    getCardBadges: function (t, options) {
      return Filterello.Flags._getShowFlagOnCardFrontProperty(t)
      .then(function (showFlagOnCardFront) {
        if (showFlagOnCardFront) {
          return Filterello.Flags._getFlaggedProperty(t)
          .then(function (flagged) {
            if (flagged) {
              return Promise.resolve([
                {
                  icon: './images/flag-white-icon.svg',
                  color: 'red'
                }
              ])
            }

            return Promise.resolve([])
          })
        }
      })
    },

    getCardButtons: function (t, options) {
      return Filterello.Flags._getFlaggedProperty(t)
      .then(function (flagged) {
        if (Filterello._checkCardWritePermissions(t)) {
          if (flagged) {
            return Promise.resolve([
              {
                icon: './images/flag-gray-icon.svg',
                text: 'Unflag',
                callback: function (t, options) {
                  if (Filterello._checkCardWritePermissions(t)) {
                    Filterello.Flags._setFlaggedProperty(t, false)
                  }
                }
              }
            ])
          }

          return Promise.resolve([
            {
              icon: './images/flag-gray-icon.svg',
              text: 'Flag',
              callback: function (t, options) {
                if (Filterello._checkCardWritePermissions(t)) {
                  Filterello.Flags._setFlaggedProperty(t, true)
                }
              }
            }
          ])
        }
      })
    },

    getCardDetailBadges: function (t, options) {
      return Filterello.Flags._getShowFlagOnCardBackProperty(t)
      .then(function (showFlagOnCardBack) {
        if (showFlagOnCardBack) {
          return Filterello.Flags._getFlaggedProperty(t)
          .then(function (flagged) {
            if (flagged) {
              return Promise.resolve([
                {
                  title: 'Flagged',
                  text: 'Yes',
                  color: 'red'
                }
              ])
            }

            return Promise.resolve([])
          })
        }
      })
    },

    showSettings: function (t, options) {
      if (Filterello._checkBoardWritePermissions(t)) {
        return Promise.resolve([
          {
            text: 'Flags',
            callback: function (t, options) {
              return t.popup({
                title: 'Flags',
                url: './flags-settings.html'
              })
            }
          }
        ])
      }

      return Promise.resolve([])
    },

    _getFlaggedProperty: function (t) {
      return t.get('card', 'private', 'com.neconix.filterello.flagged', false)
    },

    _setFlaggedProperty: function (t, flagged) {
      return t.set('card', 'private', 'com.neconix.filterello.flagged', flagged)
    },

    _getShowFlagOnCardFrontProperty: function (t) {
      return t.get('board', 'private', 'com.neconix.filterello.showFlagOnCardFront', true)
    },

    _setShowFlagOnCardFrontProperty: function (t, showFlagOnCardFront) {
      return t.set('board', 'private', 'com.neconix.filterello.showFlagOnCardFront', showFlagOnCardFront)
    },

    _getShowFlagOnCardBackProperty: function (t) {
      return t.get('board', 'private', 'com.neconix.filterello.showFlagOnCardBack', true)
    },

    _setShowFlagOnCardBackProperty: function (t, showFlagOnCardBack) {
      return t.set('board', 'private', 'com.neconix.filterello.showFlagOnCardBack', showFlagOnCardBack)
    },

    _getFlaggedCards: function (t) {
      return t.cards('id', 'name')
      .then(function (cards) {
        if (cards) {
          var cardFlags = []

          for (var i = 0; i < cards.length; i++) {
            var card = cards[i]
            var cardId = card.id
            var cardFlag = t.get(cardId, 'private', 'com.neconix.filterello.flagged', false)

            cardFlags.push(cardFlag)
          }

          return Promise.all(cardFlags)
          .then(function (flaggedArray) {
            if (cards.length === flaggedArray.length) {
              var flaggedCards = []

              for (var j = 0; j < cards.length; j++) {
                if (flaggedArray[j]) {
                  var card = cards[j]

                  flaggedCards.push(card)
                }
              }

              return Promise.resolve(flaggedCards)
            }

            return Promise.resolve([])
          })
        }

        return Promise.resolve([])
      })
    }

  },

  //
  // Quick Filters module
  //

  QuickFilters: {

    getBoardButtons: function (t, options) {
      return Promise.resolve([
        {
          icon: './images/clock-white-icon.svg',
          text: 'Recent',
          callback: function (t, options) {
            return Filterello.QuickFilters._getRecentCards(t)
            .then(function (cards) {
              var items = []

              if (cards) {
                var createItemFromCard = (function (card) {
                  var cardName = card.name
                  var cardId = card.id

                  var item = {
                    text: cardName,
                    callback: function (t, options) {
                      t.showCard(cardId)
                    }
                  }

                  return item
                })

                for (var i = 0; i < cards.length; i++) {
                  var card = cards[i]

                  if (card) {
                    var item = createItemFromCard(card)

                    items.push(item)
                  }
                }
              }

              var maxItems = 10

              if (items.length > maxItems) {
                var moreResultsItemText = "View All (showing 10 of " + cards.length + ")"
 
                var moreResultsItem = {
                  text: moreResultsItemText,
                  alwaysVisible: true,
                  callback: function (t, options) {
                    maxItems = 1000

                    items.pop()
                    t.closePopup()

                    return t.popup({
                      title: 'Recent',
                      items: items,
                      search: {
                        count: maxItems,
                        placeholder: 'Search recent cards',
                        empty: 'No recent cards'
                      }
                    })
                  }
                }

                items.push(moreResultsItem)
              }

              t.closePopup()

              return t.popup({
                title: 'Recent',
                items: items,
                search: {
                  count: maxItems,
                  placeholder: 'Search recent cards',
                  empty: 'No recent cards'
                }
              })
            })
          }
        }
      ])
    },

    getCardBadges: function (t, options) {
      return Promise.resolve([])
    },

    getCardButtons: function (t, options) {
      return Promise.resolve([])
    },

    getCardDetailBadges: function (t, options) {
      return Promise.resolve([])
    },

    showSettings: function (t, options) {
      if (Filterello._checkBoardWritePermissions(t)) {
        return Promise.resolve([
          {
            text: 'Recent Filter',
            callback: function (t, options) {
              return t.popup({
                title: 'Recent Filter',
                url: './quick-filters-settings.html'
              })
            }
          }
        ])
      }

      return Promise.resolve([])
    },

    _getShowCreatedCardsInRecentFilterProperty: function (t) {
      return t.get('board', 'private', 'com.neconix.filterello.showCreatedCardsInRecentFilter', true)
    },

    _setShowCreatedCardsInRecentFilterProperty: function (t, showCreatedCardsInRecentFilter) {
      return t.set('board', 'private', 'com.neconix.filterello.showCreatedCardsInRecentFilter', showCreatedCardsInRecentFilter)
    },

    _getCreatedCardTimeIntervalProperty: function (t) {
      return t.get('board', 'private', 'com.neconix.filterello.createdCardTimeInterval', 86400)
    },

    _setCreatedCardTimeIntervalProperty: function (t, createdCardTimeInterval) {
      return t.set('board', 'private', 'com.neconix.filterello.createdCardTimeInterval', createdCardTimeInterval)
    },

    _getShowUpdatedCardsInRecentFilterProperty: function (t) {
      return t.get('board', 'private', 'com.neconix.filterello.showUpdatedCardsInRecentFilter', true)
    },

    _setShowUpdatedCardsInRecentFilterProperty: function (t, showUpdatedCardsInRecentFilter) {
      return t.set('board', 'private', 'com.neconix.filterello.showUpdatedCardsInRecentFilter', showUpdatedCardsInRecentFilter)
    },

    _getUpdatedCardTimeIntervalProperty: function (t) {
      return t.get('board', 'private', 'com.neconix.filterello.updatedCardTimeInterval', 86400)
    },

    _setUpdatedCardTimeIntervalProperty: function (t, updatedCardTimeInterval) {
      return t.set('board', 'private', 'com.neconix.filterello.updatedCardTimeInterval', updatedCardTimeInterval)
    },

    _getRecentCards: function (t) {
      return Promise.all([
        t.cards('all'),
        Filterello.QuickFilters._getShowCreatedCardsInRecentFilterProperty(t),
        Filterello.QuickFilters._getCreatedCardTimeIntervalProperty(t),
        Filterello.QuickFilters._getShowUpdatedCardsInRecentFilterProperty(t),
        Filterello.QuickFilters._getUpdatedCardTimeIntervalProperty(t)
      ])
      .then(function (array) {
        var cards = array[0]
        var showCreatedCardsInRecentFilter = array[1]
        var createdCardTimeInterval = array[2]
        var showUpdatedCardsInRecentFilter = array[3]
        var updatedCardTimeInterval = array[4]

        var recentCards = []

        if (cards) {
          var currentDate = Date.now()

          for (var i = 0; i < cards.length; i++) {
            var card = cards[i]
            var cardId = card.id
            var cardDateLastActivity = card.dateLastActivity

            if (card && cardId && cardDateLastActivity) {
              var isRecent = false

              if (showCreatedCardsInRecentFilter) {
                var createdDate = Filterello.QuickFilters._getCreatedDateFromCardId(cardId)

                if (createdDate >= (currentDate - createdCardTimeInterval * 1000)) {
                  isRecent = true
                }
              }

              if (showUpdatedCardsInRecentFilter) {
                var updatedDate = Filterello.QuickFilters._getDateFromString(cardDateLastActivity)

                if (updatedDate >= (currentDate - updatedCardTimeInterval * 1000)) {
                  isRecent = true
                }
              }

              if (isRecent) {
                recentCards.push(card)
              }
            }
          }
        }

        recentCards.sort(function (c1, c2) {
          if (c1 && c2) {
            var c1DateLastActivity = c1.dateLastActivity
            var c2DateLastActivity = c2.dateLastActivity

            if (c1DateLastActivity && c2DateLastActivity) {
              var c1UpdateDate = Filterello.QuickFilters._getDateFromString(c1DateLastActivity)
              var c2UpdateDate = Filterello.QuickFilters._getDateFromString(c2DateLastActivity)

              return c2UpdateDate - c1UpdateDate
            }
          }

          return 0
        })

        return Promise.resolve(recentCards)
      })
    },

    _getCreatedDateFromCardId: function (cardId) {
      if (cardId) {
        var cardIdTimestamp = cardId.substring(0, 8)
        var createdDate = parseInt('0x' + cardIdTimestamp) * 1000

        if (Number.isNaN(createdDate)) {
          return 0
        }

        return createdDate
      }

      return 0
    },

    _getDateFromString: function (stringValue) {
      if (stringValue) {
        var date = Date.parse(stringValue)

        if (Number.isNaN(date)) {
          return 0
        }

        return date
      }

      return 0
    }

  },

  //
  // Global module
  //

  // Public

  getBoardButtons: function (t, options) {
    return Promise.all([Filterello.Flags.getBoardButtons(t, options), Filterello.QuickFilters.getBoardButtons(t, options)])
    .then(function (boardButtons) {
      return Filterello._concatArrayOfArrays(boardButtons)
    })
  },

  getCardBadges: function (t, options) {
    return Promise.all([Filterello.Flags.getCardBadges(t, options), Filterello.QuickFilters.getCardBadges(t, options)])
    .then(function (cardBadges) {
      return Filterello._concatArrayOfArrays(cardBadges)
    })
  },

  getCardButtons: function (t, options) {
    return Promise.all([Filterello.Flags.getCardButtons(t, options), Filterello.QuickFilters.getCardButtons(t, options)])
    .then(function (cardButtons) {
      return Filterello._concatArrayOfArrays(cardButtons)
    })
  },

  getCardDetailBadges: function (t, options) {
    return Promise.all([Filterello.Flags.getCardDetailBadges(t, options), Filterello.QuickFilters.getCardDetailBadges(t, options)])
    .then(function (cardDetailBadges) {
      return Filterello._concatArrayOfArrays(cardDetailBadges)
    })
  },

  showSettings: function (t, options) {
    return Promise.all([Filterello.Flags.showSettings(t, options), Filterello.QuickFilters.showSettings(t, options)])
    .then(function (settingItems) {
      var items = Filterello._concatArrayOfArrays(settingItems)

      if (settingItems.length > 0) {
        return t.popup({
          title: 'Filterello Settings',
          items: items
        })
      }
    })
  },

  _concatArrayOfArrays: function (arrayOfArrays) {
    var outputArray = []

    for (var i = 0; i < arrayOfArrays.length; i++) {
      var array = arrayOfArrays[i]

      if (array) {
        outputArray = outputArray.concat(array)
      }
    }

    return outputArray
  },

  _checkBoardWritePermissions: function (t) {
    var context = t.getContext()

    if (context) {
      var permissions = context.permissions

      if (permissions.board === 'write') {
        return true
      }
    }
    
    return false
  },

  _checkCardWritePermissions: function (t) {
    var context = t.getContext()

    if (context) {
      var permissions = context.permissions

      if (permissions.card === 'write') {
        return true
      }
    }
    
    return false
  }

}

loadClient = function () {
  TrelloPowerUp.initialize({

    'board-buttons': function (t, options) {
      return Filterello.getBoardButtons(t, options)
    },

    'card-badges': function (t, options) {
      return Filterello.getCardBadges(t, options)
    },

    'card-buttons': function (t, options) {
      return Filterello.getCardButtons(t, options)
    },

    'card-detail-badges': function (t, options) {
      return Filterello.getCardDetailBadges(t, options)
    },

    'show-settings': function (t, options) {
      return Filterello.showSettings(t, options)
    }

  })
}

loadFlagsSettings = function () {
  var t = TrelloPowerUp.iframe()

  var flagCardFrontCheckbox = document.getElementById('flagCardFrontCheckbox')
  var flagCardBackCheckbox = document.getElementById('flagCardBackCheckbox')

  t.render(function () {
    return Promise.all([
      Filterello.Flags._getShowFlagOnCardFrontProperty(t),
      Filterello.Flags._getShowFlagOnCardBackProperty(t)
    ])
    .then(function (settingProperties) {
      var showFlagOnCardFront = settingProperties[0]
      var showFlagOnCardBack = settingProperties[1]

      flagCardFrontCheckbox.checked = showFlagOnCardFront
      flagCardBackCheckbox.checked = showFlagOnCardBack
    })
    .then(function () {
      t.sizeTo('#content')
      .done()
    })
  })

  flagCardFrontCheckbox.addEventListener('change', function () {
    var showFlagOnCardFront = flagCardFrontCheckbox.checked
    Filterello.Flags._setShowFlagOnCardFrontProperty(t, showFlagOnCardFront)
  })

  flagCardBackCheckbox.addEventListener('change', function () {
    var showFlagOnCardBack = flagCardBackCheckbox.checked
    Filterello.Flags._setShowFlagOnCardBackProperty(t, showFlagOnCardBack)
  })
}

loadQuickFiltersSettings = function () {
  var t = TrelloPowerUp.iframe()

  var createdCardTimeIntervalSelect = document.getElementById('createdCardTimeIntervalSelect')
  var updatedCardTimeIntervalSelect = document.getElementById('updatedCardTimeIntervalSelect')

  t.render(function () {
    return Promise.all([
      Filterello.QuickFilters._getShowCreatedCardsInRecentFilterProperty(t),
      Filterello.QuickFilters._getCreatedCardTimeIntervalProperty(t),
      Filterello.QuickFilters._getShowUpdatedCardsInRecentFilterProperty(t),
      Filterello.QuickFilters._getUpdatedCardTimeIntervalProperty(t)
    ])
    .then(function (settingProperties) {
      var showCreatedCardsInRecentFilter = settingProperties[0]
      var createdCardTimeInterval = settingProperties[1]
      var showUpdatedCardsInRecentFilter = settingProperties[2]
      var updatedCardTimeInterval = settingProperties[3]

      if (showCreatedCardsInRecentFilter) {
        createdCardTimeIntervalSelect.value = createdCardTimeInterval
      } else {
        createdCardTimeIntervalSelect.value = -1
      }

      if (showUpdatedCardsInRecentFilter) {
        updatedCardTimeIntervalSelect.value = updatedCardTimeInterval
      } else {
        updatedCardTimeIntervalSelect.value = -1
      }
    })
    .then(function () {
      t.sizeTo('#content')
      .done()
    })
  })

  createdCardTimeIntervalSelect.addEventListener('change', function () {
    var createdCardTimeIntervalSelectValue = createdCardTimeIntervalSelect.value
    
    if (createdCardTimeIntervalSelectValue === -1) {
      Filterello.QuickFilters._setShowCreatedCardsInRecentFilterProperty(t, false)
    } else {
      Filterello.QuickFilters._setShowCreatedCardsInRecentFilterProperty(t, true)
      Filterello.QuickFilters._setCreatedCardTimeIntervalProperty(t, createdCardTimeIntervalSelectValue)
    }
  })

  updatedCardTimeIntervalSelect.addEventListener('change', function () {
    var updatedCardTimeIntervalSelectValue = updatedCardTimeIntervalSelect.value
    
    if (updatedCardTimeIntervalSelectValue === -1) {
      Filterello.QuickFilters._setShowUpdatedCardsInRecentFilterProperty(t, false)
    } else {
      Filterello.QuickFilters._setShowUpdatedCardsInRecentFilterProperty(t, true)
      Filterello.QuickFilters._setUpdatedCardTimeIntervalProperty(t, updatedCardTimeIntervalSelectValue)
    }
  })
}
