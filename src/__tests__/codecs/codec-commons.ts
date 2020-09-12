import {CodecCtor} from '../../types';
import {expect} from '@tib/testlab';

export function itCodecCommons(ctor: CodecCtor) {
  describe(`${ctor.name}/commons`, function () {
    it('should encode and decode', function () {
      const obj = {foo: 'bar'};
      const codec = new ctor();
      expect(codec.decode(codec.encode(obj))).eql(obj);
    });
  });
}