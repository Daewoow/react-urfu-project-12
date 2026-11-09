import profanity from 'leo-profanity'

const dictionary = [
  ...profanity.getDictionary('en'),
  ...profanity.getDictionary('ru'),
]

profanity.clearList()
profanity.add(dictionary)

export const cleanProfanity = (text) => profanity.clean(text)
