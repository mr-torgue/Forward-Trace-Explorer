/*
Home contains some explanation about the app.
*/
const Home = () => {
  return (
    <div>
      <h2>What is Forward Trace Explorer?</h2>
      <p>
      Forward Trace Explorer(FTE) is a program for tracing products in a supply chain.
      FTE uses the Ethereum blockchain to trace products. 
      </p>
      <h2>What is forward traceability?</h2>
      <p>
      Forward traceability is a more strict form of traceability. Conventionally traceability means being able to reconstruct the history of a product. We call this the trace of a product. 
      This is important but does not say anything about the validity of the trace. Forward traceability combines trace generation with validation.  
      </p>
      <figure class="left">
        <img src="img/traceability.png" alt="" />
        <figcaption>Normal traceability</figcaption>
      </figure>
      <figure class="right">
        <img src="img/fw-traceability.png" alt="" />
        <figcaption>Our approach: forward traceability</figcaption>
      </figure>
      <p>
      </p>
      <h2>Components of FTE</h2>
      <p>
      FTE is build on the Ethereum blockchain. It uses two smart contracts to keep track of participants and products.
      Each product is represented as a smart contract as well (a bit like an NFT).
      </p>
      <h2>How does it work?</h2>
      <p>
      FTE consists has three actions: <i>register participant</i>, <i>create product</i>, and <i>update product</i>.
      The <i>register participant</i> action adds the currently active account to the participant table. Once registered the user can create and update products.
      <br /><br />
      The <i>create product</i> action creates a new product. It requires that the current user is registered as a participant. 
      The participant creates a path from the available participants. This means that the product has to follow this path in the right sequence to be valid.
      <br /><br />
      The <i>update product</i> action updates a product. The update is only succesful if the following can be verified:
      </p>
      <ol>
        <li>The user is a registered participant</li>
        <li>The user is the next participant in the trace</li>
        <li>The user provides the correct key for the last event</li>
      </ol>
      <h2>Future directions</h2>
      <p>
      There is a lot to improve. The most important improvements are:
      </p>
      <ol>
        <li><b>Add RFID integration.</b> Tag reads/writes should trigger update in smart contract.</li>
        <li><b>Add participant login.</b></li>
        <li><b>Implement roles.</b>For example, admin, retailer, whole-seller, producer. For example, admins should be able to add others.</li>
        <li><b>Implement product as NFT.</b></li>
      </ol> 
    </div>
  );
}

export default Home;