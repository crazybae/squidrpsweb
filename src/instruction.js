import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';

function ShowInstruction() {
  const [show, setShow] = useState(false);

  if (show) {
    return (
      <Alert variant="primary" onClose={() => setShow(false)} dismissible>
        <Alert.Heading>
          Manual
        </Alert.Heading>
        <ul>
          <li>Get master's three cards randomly</li>
          <li>Get your three cards randomly</li>
          <li>Each card automatically generates five items among rock, paper, scissors by the rules below</li>
          <li>Five rock-paper-scissors game determines a round winner</li>
          <li>A final winner will be determined through three rounds</li>
        </ul>
        <Alert.Heading>
          Rules
        </Alert.Heading>
        <ul>
          <li>ㄱ:0 ㄴ:1 ㄷ:2 ㄹ:3 ㅁ:4 ㅂ:5 ㅅ:6 ㅇ:7 ㅈ:8 ㅊ:9 ㅋ:10 ㅌ:11 ㅍ:12 ㅎ:13 Triangle:14 --(mod 3)--&gt; 0:rock, 1:paper, 2:scissors</li>
          <li>The first four genes and last four genes are assumed as two four-digit integers and are converted samely. E.g., 1234 0203 --(mod 3)--&gt; 1:paper 2:scissors</li>
        </ul>
      </Alert>
    );
  }
  return (
    <Button variant="info" onClick={() => setShow(true)}>
      Instruction
    </Button>
  );
}

export default ShowInstruction;
