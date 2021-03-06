import colorConverter from '~/utils/color-converter';
import { Icon, Screenshot, RelatedApplication, CodeError } from '~/store/modules/generator';

export const helpers = {
  MEMBER_PREFIX: 'mjs_',
  COLOR_OPTIONS: {
    none: 'none',
    transparent: 'transparent',
    pick: 'pick'
  },

  async isValidUrl(siteUrl: string): Promise<any> {
    /*try {
      return await fetch(siteUrl, {
        mode: 'no-cors'
      });

      // return /^(http|https):\/\/[^ "]+$/.test(siteUrl);
    }
    catch(err) {
      console.error('error in helper', err, err.message);
      return err;
    }*/
    try {
      return await fetch(siteUrl, {
        mode: 'no-cors'
      });
    }
    catch (err) {
      return err;
    }
  },

  getImageIconSize(aSrc: string): Promise<{ width: number, height: number }> {
    return new Promise(resolve => {
      if (typeof document === 'undefined') {
        resolve({ width: -1, height: -1 });
      }

      let tmpImg = document.createElement('img');
      tmpImg.onload = () => {
        resolve({
          width: tmpImg.width,
          height: tmpImg.height
        });
      };

      tmpImg.src = aSrc;
    });
  },

  prepareIconsUrls(icons: (Icon | Screenshot)[], baseUrl: string) {
    return icons.map(icon => {
      if (!icon.src.includes('http') && !icon.src.includes('data:image')) {
        const pathArray = baseUrl.split('/');
        const protocol = pathArray[0];
        const host = pathArray[2];
        let pathsNumber = pathArray.length;
        let additionnalPath = '';
        // Images are not directly stored at the root level
        if (pathsNumber > 3) {
          // Removing possible filename at the end of the URL or #
          if (pathArray[pathArray.length - 1].indexOf('.') !== -1 || pathArray[pathArray.length - 1].indexOf('#') !== -1) {
            pathsNumber--;
          }
          for (let i = 3; i < pathsNumber; i++) {
            additionnalPath += '/' + pathArray[i];
          }
        }
        baseUrl = protocol + '//' + host + additionnalPath;
        //remove posible trailing/leading slashes 
        icon.src = `${baseUrl.replace(/\/$/, '')}/${icon.src.replace(/^\/+/g, '')}`;
      }
      return icon;
    });
  },

  async getImageDataURI(file: File): Promise<string> {
    return new Promise<string>(resolve => {
      const reader = new FileReader();

      reader.onload = (aImg: any) => {
        const result: string = aImg.target.result;
        resolve(result);
      };

      reader.readAsDataURL(file);
    });
  },

  hasRelatedApplicationErrors(app: RelatedApplication): string | undefined {
    if (!app.platform) {
      return 'error.enter_platform';
    }

    if (!app.url && !app.id) {
      return 'error.enter_url';
    }

    const urlRegExpr = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.?[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
    if (app.url && !urlRegExpr.test(app.url)) {
      return 'error.enter_valid_url';
    }

    return;
  },

  fixColorFromServer(color: string): string {
    if (!color) {
      return '';
    }

    return '#' + colorConverter.toHexadecimal(color).slice(4, 10);
  },

  sumIssues(errors: CodeError[] | null): number {
    if (!errors) {
      return 0;
    }

    let total = 0;
    errors.forEach(error => {
      if (error.issues && error.issues.length) {
        total += error.issues.length;
      }
    });

    return total;
  }
};
