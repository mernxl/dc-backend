import { ClientSession, Connection, Document, DocumentQuery } from 'mongoose';

export type CompoundIndex<T extends Document> = { [key in keyof Omit<T, keyof Document>]?: number };
export type QueryHelperThisAndReturnType<T, Doc extends Document, QH> = DocumentQuery<T, Doc, QH> &
  QH;

/**
 * Function used to wrap session aware methods, and returns the value returned within that function.
 * This function assumes all models belong to about same db, or you pass a db where it will create a
 * fresh session.
 *
 * @param config
 * @param method
 */
export const sessionAwareMethod = async <T>(
  config: { db: Connection; session?: ClientSession },
  method: (session: ClientSession) => Promise<T>,
): Promise<T> => {
  const session = config.session || (await config.db.startSession());

  let returnValue: T;

  if (session.inTransaction()) {
    returnValue = await method(session);
  } else {
    await session.withTransaction(async () => (returnValue = await method(session)));

    session.endSession();
  }

  return returnValue!;
};

/**
 * Get a lowercase snake_case collection name from a CamelCase modelName
 * @param modelName - Module name to create collection name from
 * @param postfix - postfix to affix on the the collection name before returning, like s
 */
export const modelNameToCollectionName = (modelName: string, postfix = ''): string => {
  let collectionName = '';

  for (let i = 0; i < modelName.length; i++) {
    if (modelName[i].match(/[A-Z]/)) {
      if (i > 0) {
        collectionName += `_${modelName[i].toLowerCase()}`;
      } else {
        // if first, no underscore
        collectionName += `${modelName[i].toLowerCase()}`;
      }
    } else {
      collectionName += modelName[i];
    }
  }

  return collectionName + postfix;
};
