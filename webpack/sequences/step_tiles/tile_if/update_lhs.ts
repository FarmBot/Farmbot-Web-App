
interface LhsUpdateProps {
  currentSequence: TaggedSequence;
  currentStep: If;
  dispatch: Function;
  index: number;
  resources: ResourceIndex;
}
export const updateLhs =
  (props: IfParams) =>
    (ddi: DropDownItem) => {
      fancyDebug(e);
      const stepCopy = defensiveClone(step);
      const seqCopy = defensiveClone(sequence).body;
      const val = e.value;
      seqCopy.body = seqCopy.body || [];
      if (_.isString(val)) { stepCopy.args[field] = val; }
      seqCopy.body[index] = stepCopy;
      dispatch(overwrite(sequence, seqCopy));
    }
