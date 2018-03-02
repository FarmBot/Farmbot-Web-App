// export function indexSequenceById(index: ResourceIndex) {
//   const output: CowardlyDictionary<TaggedSequence> = {};
//   const uuids = index.byKind.Sequence;
//   uuids.map(uuid => {
//     assertUuid("Sequence", uuid);
//     const sequence = index.references[uuid];
//     if (sequence && isTaggedSequence(sequence) && sequence.body.id) {
//       output[sequence.body.id] = sequence;
//     }
//   });
//   return output;
// }

type IndexLookupDictionary = Dictionary<Resource<"Sequence", Sequence> | undefined>;
type Indexer = (index: ResourceIndex): IndexLookupDictionary;
