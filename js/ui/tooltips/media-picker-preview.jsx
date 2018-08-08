import i18n from "i18n";
import React, {Component} from "react";
import {StyleSheet, css} from "aphrodite/no-important";
import {CircularSpinner} from "@khanacademy/wonder-blocks-progress-spinner";

export default class MediaPickerPreview extends Component {
    // props mediaType, mediaSrc, errorMessage, errorType
    props: {
        errorMessage: string,
        mediaType: string,
        mediaSrc: string,
    };

    constructor(props) {
        super(props);
        this.state = {
            imageLoaded: false,
        };
        this.handleImageLoad = this.handleImageLoad.bind(this);
        this.handleImageError = this.handleImageError.bind(this);
    }

    handleImageLoad() {
        this.setState({imageLoaded: true, errorMessage: ""});
    }

    handleImageError() {
        this.setState({
            errorMessage: i18n._("That is not a valid image URL."),
        });
    }

    render() {
        let errorDiv;
        const errorMessage =
            this.state.errorMessage || this.props.errorMessage;
        if (errorMessage) {
            errorDiv = (
                <div className={css(styles.error)}>{errorMessage}</div>
            );
        }

        let mediaPreview;
        if (this.props.mediaType === "audio") {
            mediaPreview = (
                <div>
                    <audio
                        className={css(styles.audio)}
                        src={this.props.mediaSrc}
                        controls
                    />
                    {errorDiv}
                </div>
            );
        } else {
            // Only show throbber while we're waiting for image to load
            let loadingImg;
            if (!this.state.imageLoaded && this.props.mediaSrc) {
                loadingImg = <CircularSpinner size="small" />;
            }

            mediaPreview = (
                <div>
                    {loadingImg}
                    <div className={css(styles.imgBox)}>
                        <img
                            className={css(styles.img)}
                            alt={i18n._("Selected image file")}
                            src={this.props.mediaSrc}
                            onLoad={this.handleImageLoad}
                            onError={this.handleImageError}
                        />
                        {errorDiv}
                    </div>
                </div>
            );
        }

        return mediaPreview;
    }
}

const styles = StyleSheet.create({
    audio: {
        maxWidth: "100%",
    },
    imgBox: {
        height: "100px",
        width: "100%",
        marginBottom: "5px",
        textAlign: "center",
    },
    img: {
        display: "inline-block",
        maxWidth: "100%",
        maxHeight: "100%",
        verticalAlign: "middle",
    },
    error: {
        display: "inline-block",
        verticalAlign: "middle",
        textAlign: "center",
        color: "red",
        fontWeight: "bold",
        paddingTop: "30%",
    },
});