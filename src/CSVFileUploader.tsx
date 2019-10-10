import React from 'react';

export interface FileHandler{
    (file: FileList | null): void;
}
export interface Props {
    onFileSelect: FileHandler,
    file: File | null
}

export default class CSVFileUploader extends React.Component<Props, {}>{
      
    render() {
    const message = this.props.file != null ? this.props.file.name : "Selecteer CSV ledenlijst";
      return (
          <div className="input-group">
            <div className="custom-file">
                <input
                type="file"
                className="custom-file-input"
                id="inputGroupFile01"
                aria-describedby="csvFileUpload"
                onChange={ (e) => this.props.onFileSelect(e.target.files) }
                />
                <label className="custom-file-label" htmlFor="csvFileUpload">
                    {message}
                </label>
            </div>
        </div>
      );
    }
}