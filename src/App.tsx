import React from 'react';
import './App.css';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import CSVFileUploader from './CSVFileUploader';
import Ledenlijsten from './Ledenlijsten';

interface Props{

}

interface State{
  file: File | null;
}

export default class App extends React.Component<Props,State>{

  constructor(props: Props){
    super(props);
    this.state = {
      file: null
    };
  }

  setFile(file: File | null): void{
    this.setState( {
      file: file
    });
  }

  render(){
    return (
      <Container>
        <Row className="justify-content-md center">
          <h1>Assist ledenlijsten</h1>
        </Row>
        <Row className="justify-content-md-center">
          <Col>
            <ol>
              <li>Ga naar <a href="https://www.assistonline.eu/signin.aspx">assistonline.eu</a>.</li>
              <li>Download het overzicht van alle ledenlijsten als CSV bestand.</li>
              <li>Converteer het CSV bestand naar ledenlijsten met behulp van deze website. Klik op de groepsnamen om de ledenlijsten te downloaden.</li>
            </ol>
            <CSVFileUploader 
            onFileSelect={(fileList) => this.setFile(fileList != null && fileList.length === 1 ? fileList[0] : null)}
            file = {this.state.file}
             />  
          </Col>
        </Row>
        <Row className="justify-content-md-center">
          <Col>
            <Ledenlijsten file={this.state.file}/>
          </Col>
        </Row>
      </Container>
    );
  }
}