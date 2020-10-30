import {expect} from '@loopback/testlab';
import {fixture} from './support';
import {detect} from '../detect';
import {yaml} from '../codecs';

describe('detect', function () {
  it('should detected if file exists', function () {
    const file = fixture('foo.yaml');
    const detected = detect(file);
    expect(detected).deepEqual({file, lang: yaml.lang, codec: yaml});
  });

  it('should detected with lang', function () {
    const file = fixture('foo');
    const detected = detect(file, 'yaml');
    expect(detected).deepEqual({
      file: `${file}.yml`,
      lang: yaml.lang,
      codec: yaml,
    });
  });

  it('should detected automatically', function () {
    const file = fixture('foo');
    const detected = detect(file);
    expect(detected).deepEqual({
      file: `${file}.yml`,
      lang: yaml.lang,
      codec: yaml,
    });
  });

  it('should not detected with unsupported lang for the file that not exits', function () {
    const file = fixture('foo');
    const detected = detect(file, 'bar');
    expect(detected).undefined();
  });

  it('should not detected with unsupported lang for the file that exits', function () {
    const file = fixture('foo.toml');
    const detected = detect(file, 'bar');
    expect(detected).undefined();
  });

  it('should not detected without lang argument if file is not exist', function () {
    const file = fixture('bar');
    const detected = detect(file);
    expect(detected).undefined();
  });

  it('should not detected with supported lang if file is not exist', function () {
    const file = fixture('bar');
    const detected = detect(file, 'yaml');
    expect(detected).undefined();
  });
});
