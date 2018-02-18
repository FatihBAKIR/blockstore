export enum DificultyMode 
{
  Static,
  Rolling
}

export enum BroadcastMode
{
  Sync,
  Async
}

export enum BroadcastMinGuarantee 
{
  None,
  Single,
  Double,
  Majority,
  All
}

export interface Config 
{
  // Maximum data size of the Value in the Operation parameters
  operationMaxSize: number;

  // Maximum amount of data a single Block can contain (including meta info)
  blockMaxSize: number;

  // Maximum number of Operations a single Block can contain
  blockMaxOperationCount: number;

  // The metric to be used for calculating the difficulty of Appending a Block
  //
  // - Static: the difficulty is a predetermined number of 0's that the computed hash must
  //    have as its most signifigant bits. This value is defined as difficultyTargetValue
  // - Rolling: the difficulty will be adjusted dynamically in response to how quickly blocks
  //    are being Appended, targeting a predetermined time value. This value is defined as 
  //    difficultyTargetValue
  difficultyMode: DificultyMode;

  // A value used to control the difficulty of the Append algorithm
  //
  // - If difficultyMode is set to Static, this value is the number of most-signifigant 0 
  //    bits in the hash computed by the Append algorithm
  // - If difficultyMode is set to Rolling, this value is the number in milliseconds that
  //    the system should target for how long the Append algorithm takes on average
  difficultyTargetValue: number;

  // The behavior of how new blocks are broadcasted throughout the system
  //
  // - Sync: an operation will block until the number of chains that have responded with
  //    accepting the new block is broadcastMinGaurantee
  // - Async: an operation will return (succesfully) without waiting for the number of chains
  //    defined by broadcastMinGaurantee to reply
  broadcastMode: BroadcastMode;

  // A minimum guarantee on the number of chain replicas that have accepted a new block as
  // creating the longest chain. 
  //
  // OPTIONAL: This property is only used when 'broadcastMode' is set to 'Sync'
  //
  // NOTE: This is a minimum; the system always attempts to achieve eventual consistancy among 
  // all of the chains
  //
  // - None: no replicas are gauranteed to exist. Thus, the original block is the only block
  // - Single: one replica of the original block has been accepted
  // - Double: two replicas of the original block has been accepted
  // - Majority: a majority of the known alive replica nodes have accepted the block
  // - All: all of the known alive replica nodes have accepted the block
  broadcastMinGuarantee: BroadcastMinGuarantee;
}
